const baseHref = typeof import.meta.env.BASE_URL === 'string' ? import.meta.env.BASE_URL : '/'

/** Served from `/public/logo.png` */
export const PUBLIC_LOGO_SRC = `${baseHref.endsWith('/') ? baseHref : `${baseHref}/`}logo.png`
