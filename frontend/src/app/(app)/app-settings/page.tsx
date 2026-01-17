import { getGlobalSettings } from '@/features/app-settings/services';
import GlobalSettingsForm from '@/features/app-settings/components/global-settings-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default async function AppSettingsPage() {
  let settings;
  let error = null;

  try {
    settings = await getGlobalSettings();
  } catch (err) {
    console.error('Erreur lors du chargement des paramètres:', err);
    error = err;
  }

  if (error || !settings) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Impossible de charger les paramètres de l&apos;application. 
            Veuillez vérifier que le serveur est accessible et réessayer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <GlobalSettingsForm initialSettings={settings} />
    </div>
  );
}