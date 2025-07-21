export interface BucketEntry {
  type: 'FOLDER' | 'FILE'
  name: string
  size?: number
  lastModified?: string
}
