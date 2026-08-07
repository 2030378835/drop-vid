/** 与 push-drop-vid/update/latest.json 结构一致 */
export type UpdatePlatformKey = 'darwin-arm64' | 'darwin-x64' | 'win32-x64'

export interface UpdateManifest {
  version?: string
  notes?: string
  releaseUrl?: string
  downloads?: Partial<Record<UpdatePlatformKey | string, string>>
  fallbackUrl?: string
}
