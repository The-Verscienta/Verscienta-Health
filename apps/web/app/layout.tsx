/**
 * Root Layout - Pass-through only
 *
 * This layout doesn't render HTML structure to allow route groups
 * to have their own independent HTML documents:
 * - (app) route group: Main application with custom HTML structure
 * - (payload) route group: Payload CMS admin with its own HTML structure
 *
 * Each route group handles its own <html>, <head>, and <body> tags.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
