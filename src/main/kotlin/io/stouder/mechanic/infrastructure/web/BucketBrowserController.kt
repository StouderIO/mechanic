package io.stouder.mechanic.infrastructure.web

import io.stouder.mechanic.domain.BucketEntry
import io.stouder.mechanic.domain.BucketId
import io.stouder.mechanic.domain.ports.inbound.bucket.DeleteFileUseCase
import io.stouder.mechanic.domain.ports.inbound.bucket.GetFileUseCase
import io.stouder.mechanic.domain.ports.inbound.bucket.ListFilesUseCase
import io.stouder.mechanic.domain.ports.inbound.bucket.UploadFileUseCase
import io.swagger.v3.oas.annotations.Operation
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Profile
import org.springframework.core.io.ByteArrayResource
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Path
import java.nio.file.Paths

@RestController
@RequestMapping("/api/buckets/{bucketId}")
@ConditionalOnProperty(prefix = "mechanic.browse", name = ["enable"], havingValue = "true")
class BucketBrowserController(
    private val listFilesUseCase: ListFilesUseCase,
    private val getFileUseCase: GetFileUseCase,
    private val deleteFileUseCase: DeleteFileUseCase,
    private val uploadFileUseCase: UploadFileUseCase,
) {

    @GetMapping
    @Operation(operationId = "listBucketFiles")
    fun listBucketFiles(@PathVariable("bucketId") bucketId: BucketId, @RequestParam path: String): ResponseEntity<ListBucketFilesResponse> {
        val files = this.listFilesUseCase.listFiles(bucketId, path)
        return ResponseEntity.ok(ListBucketFilesResponse(files))
    }

    @GetMapping("/file")
    @Operation(operationId = "getBucketFile")
    fun getBucketFile(@PathVariable("bucketId") bucketId: BucketId, @RequestParam path: String): ResponseEntity<ByteArrayResource> {
        val fileContent = this.getFileUseCase.getFile(bucketId, path)
        val resource = ByteArrayResource(fileContent)
        val contentType = MediaType.APPLICATION_OCTET_STREAM
        val filename = Paths.get(path).fileName.toString()
        return ResponseEntity.ok()
            .contentType(contentType)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$filename\"")
            .body(resource)
    }

    @DeleteMapping("/file")
    @Operation(operationId = "deleteBucketFile")
    fun deleteBucketFile(@PathVariable("bucketId") bucketId: BucketId, @RequestParam path: String): ResponseEntity<Unit> {
        this.deleteFileUseCase.deleteFile(bucketId, path)
        return ResponseEntity.ok().build()
    }

    @PutMapping("/file")
    @Operation(operationId = "uploadBucketFiles")
    fun uploadBucketFiles(@PathVariable("bucketId") bucketId: BucketId, @RequestParam path: String, @RequestParam files: List<MultipartFile>): ResponseEntity<Unit> {
        files
            .stream()
            .filter { it.originalFilename != null }
            .filter { !it.isEmpty }
            .forEach {
                val filePath = Paths.get(path, it.originalFilename).toString()
                this.uploadFileUseCase.uploadFile(bucketId, filePath, it.bytes)
            }
        return ResponseEntity.ok().build()
    }
}

data class ListBucketFilesResponse(val files: List<BucketEntry>)
