import { Dialog } from '@headlessui/react';
import { h, Fragment } from 'preact';
import { useRef, useState } from 'react';
import Button from '../../components/button';
import Icons from '../../components/icons';
import { Textarea } from '../../components/textarea';
import lzString from 'lz-string';

export const ImportExport = () => {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const exportedSettings = useRef<string>('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importString, setImportString] = useState('');

  const exportSettings = () => {
    const settingsObject = Object.keys(localStorage).reduce<Record<string, string | null>>(
      (obj, key) => {
        try {
          const value = localStorage.getItem(key);
          if (value !== null) {
            obj[key] = JSON.parse(value);
          }
        } catch {}
        return obj;
      },
      {}
    );

    exportedSettings.current = lzString.compress(JSON.stringify(settingsObject));
    setShowExportDialog(true);
  };

  const importSettings = () => {
    const decompressedSettings: string | null = lzString.decompress(importString);
    if (!decompressedSettings) return;

    const parsedSettings = JSON.parse<Record<string, unknown>>(decompressedSettings);
    for (const [key, value] of Object.entries(parsedSettings)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
    window.location.reload();
  };

  return (
    <Fragment>
      <h3 className="text-lg font-semibold">Importer og eksporter</h3>
      <p className="mt-2 text-sm text-gray-700">
        Du kan eksportere innstillingene dine i denne nettleseren for å importere dem i en annen
        nettleser, eller du kan importere innstillinger fra en annen nettleser her.
      </p>
      <div className="mt-4 flex gap-4">
        <Button key="import" onClick={() => setShowImportDialog(true)}>
          <Icons.Import className="mr-1" />
          Importer
        </Button>
        <Button key="export" onClick={exportSettings}>
          <Icons.Export className="mr-1" />
          Eksporter
        </Button>
      </div>
      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        className="relative z-10"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center">
            <Dialog.Panel className="bg-white p-8 sm:rounded-lg shadow-2xl">
              <Dialog.Title className="text-lg font-semibold">Eksporter innstillinger</Dialog.Title>
              <Dialog.Description className="mt-4">
                <p>
                  Kopier de komprimerte innstillingene under, så kan du trykke {'"Importer"'} i en
                  annen nettlester og lime inn teksten der.
                </p>
                <Textarea className="mt-2" value={exportedSettings.current} />
              </Dialog.Description>
              <div className="mt-4 space-x-4">
                <Button onClick={() => setShowExportDialog(false)}>Lukk</Button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
      <Dialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        className="relative z-10"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center">
            <Dialog.Panel className="bg-white p-8 sm:rounded-lg shadow-2xl">
              <Dialog.Title className="text-lg font-semibold">Importer innstillinger</Dialog.Title>
              <Dialog.Description className="mt-4">
                <p>Lim inn de komprimerte innstillingene under og trykk {'"Importer"'}.</p>
                <Textarea
                  className="mt-2"
                  value={importString}
                  onChange={(e) => setImportString((e.target as HTMLTextAreaElement).value)}
                />
              </Dialog.Description>
              <div className="mt-4 space-x-4">
                <Button
                  onClick={importSettings}
                  importance="primary"
                  disabled={!importString.length}
                >
                  Importer og last på nytt
                </Button>
                <Button onClick={() => setShowImportDialog(false)}>Lukk</Button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Fragment>
  );
};
