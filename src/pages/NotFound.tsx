import { useLocation } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t('not_found_title')}</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t('not_found_text')}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t('return_home')}
        </a>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
