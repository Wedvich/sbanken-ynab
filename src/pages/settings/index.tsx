import { Fragment, h } from 'preact';
import { useCallback, useEffect, useId, useState } from 'preact/hooks';
import classNames from 'classnames';
import Button from '../../components/button';
import { FocusTrap } from '@headlessui/react';
import { Section } from './section';

interface YnabTokenEditorProps {
  token?: string;
}

const YnabTokenEditor = ({ token }: YnabTokenEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tokenValue, setTokenValue] = useState(token);
  const id = useId();

  const beginEditing = () => {
    setTokenValue(token);
    setIsEditing(true);
  };

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      stopEditing();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.defaultPrevented || (e.target instanceof HTMLElement && e.target.closest(`#${id}`)))
        return;
      stopEditing();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [id, isEditing, stopEditing]);

  const contents = (
    <Fragment>
      <span className="flex items-center flex-grow">
        <span className="flex flex-col text-sm flex-grow">
          {isEditing ? (
            <input
              type="text"
              value={tokenValue}
              onChange={(e) => setTokenValue((e.target as HTMLInputElement).value)}
              className="text-lg bg-pink-50 m-0 border-0 border-b border-transparent focus:border-pink-600 -mb-[1px] selection:bg-pink-300 focus:ring-0"
              onFocus={(e) => {
                (e.target as HTMLInputElement).select();
              }}
            />
          ) : (
            !!token && (
              <span className="font-semibold text-gray-900 group mr-auto">
                <span className="group-hover:hidden">…{token.slice(-6)}</span>
                <span className="hidden group-hover:inline">{token}</span>
              </span>
            )
          )}
          {!!token && !isEditing && <span className="text-gray-500 mt-1">Connecting…</span>}
        </span>
      </span>
      <span className="mt-2 flex flex-col sm:flex-row text-sm sm:mt-0 sm:ml-6 gap-2 items-center">
        {!isEditing ? (
          <Fragment>
            <Button
              key="edit"
              onClick={beginEditing}
              size={!token ? 'lg' : undefined}
              importance={!token ? 'primary' : undefined}
            >
              {token ? 'Endre' : 'Legg til ny'}
            </Button>
            {!!token && <Button key="remove">Fjern</Button>}
          </Fragment>
        ) : (
          <Fragment>
            <Button key="save">Lagre</Button>
            <Button key="cancel" onClick={stopEditing}>
              Avbryt
            </Button>
          </Fragment>
        )}
      </span>
    </Fragment>
  );

  return (
    <li
      id={id}
      className={classNames('relative block focus:outline-none sm:flex sm:justify-between', {
        'py-4 px-4 sm:px-6 border border-gray-300 shadow-sm rounded': token || isEditing,
        'border-pink-600 ring-1 ring-pink-300': isEditing,
      })}
    >
      <FocusTrap
        className="contents"
        features={
          isEditing
            ? FocusTrap.features.InitialFocus | FocusTrap.features.TabLock
            : FocusTrap.features.None
        }
      >
        {contents}
      </FocusTrap>
    </li>
  );
};

export const Settings = () => {
  const [tokens, setTokens] = useState([
    '48a4a693469a4233b8f4970781a04b97be816fd89ea84f8285419d28e48e1f19',
    '7555aed3e850406cbda876695dfe557a68f8c00deab54f32b41ffe738854116c',
  ]);

  return (
    <div className="py-10">
      <div className="max-w-7xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900">Innstillinger</h1>
          <Section
            title="You Need A Budget"
            description={
              <Fragment>
                Legg til ett eller flere{' '}
                <a
                  href="https://app.youneedabudget.com/settings/developer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 hover:underline underline-offset-2"
                >
                  Personal Access Token
                </a>{' '}
                fra YNAB og velg hvilke budsjetter du vil inkludere
              </Fragment>
            }
          >
            <ul className="space-y-4">
              {tokens.map((token) => {
                return <YnabTokenEditor key={token} token={token} />;
              })}
              <YnabTokenEditor />
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
};
