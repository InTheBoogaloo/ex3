import './globals.css';

export const metadata = {
  title: 'SII ITC — Sistema de Información Institucional',
  description: 'Portal estudiantil del Instituto Tecnológico de Celaya',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
