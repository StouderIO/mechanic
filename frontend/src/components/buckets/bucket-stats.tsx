import { FileIcon, HardDriveIcon } from 'lucide-react'
import { Stat } from '@/components/ui/stat.tsx'
import { bytesFormatter, numberFormatter } from '@/lib/utils.tsx'

export interface BucketStat {
  value: number
  quota?: number
}

export type BucketStatsProps = {
  storage: BucketStat
  objects: BucketStat
}

export default function BucketStats({ storage, objects }: BucketStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Stat
        icon={<HardDriveIcon />}
        label="Storage"
        value={storage.value}
        quota={storage.quota}
        valueTransformer={bytesFormatter}
      />
      <Stat
        icon={<FileIcon />}
        label="Objects"
        value={objects.value}
        quota={objects.quota}
        valueTransformer={numberFormatter}
      />
    </div>
  )
}
