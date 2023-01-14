import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';
import { Outlet } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { Sidebar } from '../components/sidebar';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <Fragment>
      <Dialog
        as="div"
        className="relative z-40 md:hidden"
        open={sidebarOpen}
        onClose={setSidebarOpen}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        <div className="fixed inset-0 z-40 flex">
          <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
                title="Skjul sidebar"
              >
                <span className="sr-only">Skjul sidebar</span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                >
                  <path
                    d="M18 17L13 12L18 7M11 17L6 12L11 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <Sidebar className="h-0" />
          </Dialog.Panel>
          <div className="w-14 flex-shrink-0" />
        </div>
      </Dialog>

      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
          <Sidebar className="flex flex-col" />
        </div>
      </div>
      <div className="flex flex-1 flex-col md:pl-64">
        <div className="sticky top-0 z-10 bg-gray-100 pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
            onClick={() => setSidebarOpen(true)}
            title="Vis sidebar"
          >
            <span className="sr-only">Vis sidebar</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
            >
              <path
                d="M6 17L11 12L6 7M13 17L18 12L13 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </Fragment>
  );
};