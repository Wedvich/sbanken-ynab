import { ESLint } from 'eslint';

const removeIgnoredFiles = async (files) => {
  const eslint = new ESLint();
  const ignoredFiles = await Promise.all(files.map((file) => eslint.isPathIgnored(file)));
  const filteredFiles = files.filter((_, i) => !ignoredFiles[i]);
  return filteredFiles.join(' ');
};

export default {
  '*.{js,ts,tsx}': async (files) => {
    const filesToLint = await removeIgnoredFiles(files);
    return [`eslint --max-warnings=0 ${filesToLint}`, `prettier --write ${filesToLint}`];
  },
  '*.{json,scss,md,html}': ['prettier --write'],
};
