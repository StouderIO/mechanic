export interface Permission {
  accessKeyId: string
  name: string
  read?: boolean
  write?: boolean
  owner?: boolean
}
