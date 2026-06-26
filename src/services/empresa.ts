import { supabase } from '@/lib/supabase'

export async function subirLogo(emp_ide: string, file: File): Promise<string> {
  if (file.size > 2 * 1024 * 1024) throw new Error('El archivo no puede superar los 2MB')
  if (!['image/png', 'image/jpeg'].includes(file.type)) throw new Error('Solo se permiten PNG y JPEG')

  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const path = `empresas/${emp_ide}/logo.${ext}`

  const { error: uploadError } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
  if (uploadError) throw uploadError

  const { data: publicUrl } = supabase.storage.from('logos').getPublicUrl(path)
  const url = publicUrl.publicUrl

  const { error: dbError } = await supabase.from('empresas').update({ logo_url: url }).eq('emp_ide', emp_ide)
  if (dbError) throw dbError

  return url
}

export async function eliminarLogo(emp_ide: string) {
  await supabase.storage.from('logos').remove([`empresas/${emp_ide}/logo.png`, `empresas/${emp_ide}/logo.jpg`])
  await supabase.from('empresas').update({ logo_url: null }).eq('emp_ide', emp_ide)
}
