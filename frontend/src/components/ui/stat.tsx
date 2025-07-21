import { type ReactNode, useMemo } from 'react'
import { Progress } from '@/components/ui/progress.tsx'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'
import { H4 } from '@/components/ui/typography/h4.tsx'
import { P } from '@/components/ui/typography/p.tsx'

interface StatProps {
  icon?: ReactNode
  label: string
  value: number
  quota?: number
  valueTransformer?: (value: number) => string
}
export function Stat({
  icon = null,
  label,
  value,
  quota,
  valueTransformer = (value) => `${value}`,
}: StatProps) {
  const progress = useMemo(
    () => (quota === undefined ? 0 : (value / quota) * 100),
    [value, quota],
  )
  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-2">
        {icon}
        <span>{label}</span>
      </div>
      <H4>
        {valueTransformer(value)}{' '}
        {quota !== undefined && `/ ${valueTransformer(quota)}`}
      </H4>
      {quota === undefined ? (
        <div className="h-2" />
      ) : (
        <Tooltip>
          <TooltipTrigger>
            <Progress value={progress} />
          </TooltipTrigger>
          <TooltipContent>
            <P>{`${(progress).toFixed(2)}%`}</P>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
