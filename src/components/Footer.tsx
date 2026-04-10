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
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
              GitHub
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}