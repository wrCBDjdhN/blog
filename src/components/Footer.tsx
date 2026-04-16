export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} My Blog. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/wrCBDjdhN"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              GitHub
            </a>
            <a
              href="mailto:wrcbdjdh@gmail.com"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Email
            </a>
            <a
              href="https://space.bilibili.com/2004651139?spm_id_from=333.1007.0.0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Bilibili
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}