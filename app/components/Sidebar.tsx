'use client';

import { Bars3Icon, FolderIcon, StarIcon, TrashIcon } from '@heroicons/react/24/outline';
import cx from 'clsx';
import Link from 'next/link';
import { memo } from 'react';

interface Props {
  folders: string[];
  activeFolder: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

function Sidebar(props: Props) {
  const { folders, activeFolder, isSidebarOpen, toggleSidebar } = props;

  return (
    <>
      {/* invisible layer just to cover the main page, clicking this would hide the sidebar */}
      {isSidebarOpen && (
        <button
          className={cx('fixed bottom-0 top-0 left-0 right-0 z-10 md:hidden block', {
            hidden: !isSidebarOpen,
          })}
          onClick={toggleSidebar}
        ></button>
      )}

      <div
        id="sidebar"
        className={cx('bg-neutral-950 transition-all fixed bottom-0 top-0 left-0 z-20 min-h-[100lvh]', {
          'w-0 px-0 overflow-hidden': !isSidebarOpen,
          'w-72': isSidebarOpen,
        })}
      >
        <div className="w-72 px-5">
          <div className="flex items-center justify-between w-full">
            <Link href={{ pathname: '/' }} as={{ pathname: '/' }} className="py-6 font-[600] text-zinc-200 text-lg">
              Photohost.io
            </Link>
            <div className="md:hidden block">
              <button className="flex items-center justify-center" onClick={toggleSidebar}>
                <Bars3Icon className="w-6 h-6 text-neutral-300" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3 justify-center">
            <div className="">
              <Link
                href={{ pathname: '/album', query: { folder: '' } }}
                as={{ pathname: '/album', query: { folder: '' } }}
                className="flex gap-2"
              >
                <FolderIcon className="text-neutral-300 w-5" />
                <h3 className="text-sm text-neutral-300">Album</h3>
              </Link>
              {folders.length > 0 && (
                <div className="py-2 flex flex-col px-0.5">
                  {folders.map(folder => (
                    <div
                      key={folder}
                      className={cx('border-l border-l-neutral-900 flex justify-between', {
                        '!border-l-neutral-700': folder === activeFolder,
                      })}
                    >
                      <div className="flex gap-2 px-3 py-1">
                        <FolderIcon
                          className={cx('text-neutral-500 w-5 h-5 shrink-0', {
                            '!text-neutral-300': folder === activeFolder,
                          })}
                        />
                        <div>
                          <Link
                            className={cx('text-sm text-neutral-500', {
                              '!text-neutral-300': folder === activeFolder,
                            })}
                            href={`/album?folder=${encodeURIComponent(folder)}`}
                          >
                            {folder}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Link href={{ pathname: '/starred' }} as={{ pathname: '/starred' }} className="flex gap-2">
                <StarIcon className="text-neutral-300 w-5" />
                <h3 className="text-sm text-neutral-300">Starred</h3>
              </Link>
              <Link href={{ pathname: '/trash' }} as={{ pathname: '/trash' }} className="flex gap-2">
                <TrashIcon className="text-neutral-300 w-5" />
                <h3 className="text-sm text-neutral-300">Trash</h3>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(Sidebar);
