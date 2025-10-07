import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-earth-50 border-t border-gray-200 dark:bg-gray-900">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-earth-900 dark:text-earth-100 mb-4 font-serif text-lg font-bold">
              Verscienta Health
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bridging ancient herbal wisdom with modern science.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/herbs"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  Herbs Database
                </Link>
              </li>
              <li>
                <Link
                  href="/formulas"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  Herbal Formulas
                </Link>
              </li>
              <li>
                <Link
                  href="/conditions"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  Health Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/practitioners"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  Find Practitioners
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/symptom-checker"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  AI Symptom Checker
                </Link>
              </li>
              <li>
                <Link
                  href="/modalities"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  Healing Modalities
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  Medical Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Verscienta Health. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            <strong>Medical Disclaimer:</strong> This information is for educational purposes only
            and is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>
    </footer>
  )
}
