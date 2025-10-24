'use client'

import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations()
  const footerT = useTranslations('footer')

  return (
    <footer className="bg-earth-50 border-t border-gray-200 dark:bg-gray-900">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-earth-900 dark:text-earth-100 mb-4 font-serif text-lg font-bold">
              Verscienta Health
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{footerT('tagline')}</p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              {footerT('quickLinks')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/herbs"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  {t('nav.herbs')}
                </Link>
              </li>
              <li>
                <Link
                  href="/formulas"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  {t('nav.formulas')}
                </Link>
              </li>
              <li>
                <Link
                  href="/conditions"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  {t('nav.conditions')}
                </Link>
              </li>
              <li>
                <Link
                  href="/practitioners"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  {t('nav.practitioners')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              {t('nav.about')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/symptom-checker"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  {t('nav.symptomChecker')}
                </Link>
              </li>
              <li>
                <Link
                  href="/modalities"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  {t('nav.modalities')}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              {footerT('legal')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  {footerT('privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  {footerT('terms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="hover:text-earth-600 text-gray-600 transition-colors"
                >
                  {footerT('disclaimer')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">{footerT('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
