import clsx from 'clsx';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Fragment, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/20/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Tabs, TextInput } from '@tih/ui';

import {
  BROWSE_TABS_VALUES,
  EXPERIENCE,
  LOCATION,
  ROLES,
  SORT_OPTIONS,
  TOP_HITS,
} from '~/components/resumes/browse/resumeConstants';
import ResumeFilterPill from '~/components/resumes/browse/ResumeFilterPill';
import ResumeListItems from '~/components/resumes/browse/ResumeListItems';
import ResumeReviewsTitle from '~/components/resumes/ResumeReviewsTitle';
import ResumeSignInButton from '~/components/resumes/shared/ResumeSignInButton';

import { trpc } from '~/utils/trpc';

import type { Resume } from '~/types/resume';

const filters = [
  {
    id: 'roles',
    name: 'Roles',
    options: ROLES,
  },
  {
    id: 'experience',
    name: 'Experience',
    options: EXPERIENCE,
  },
  {
    id: 'location',
    name: 'Location',
    options: LOCATION,
  },
];

export default function ResumeHomePage() {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const [tabsValue, setTabsValue] = useState(BROWSE_TABS_VALUES.ALL);
  const [searchValue, setSearchValue] = useState('');
  const [resumes, setResumes] = useState<Array<Resume>>([]);
  const [renderSignInButton, setRenderSignInButton] = useState(false);
  const [signInButtonText, setSignInButtonText] = useState('');

  const allResumesQuery = trpc.useQuery(['resumes.resume.findAll'], {
    enabled: tabsValue === BROWSE_TABS_VALUES.ALL,
    onSuccess: (data) => {
      setResumes(data);
      setRenderSignInButton(false);
    },
  });
  const starredResumesQuery = trpc.useQuery(
    ['resumes.resume.user.findUserStarred'],
    {
      enabled: tabsValue === BROWSE_TABS_VALUES.STARRED,
      onError: () => {
        setResumes([]);
        setRenderSignInButton(true);
        setSignInButtonText('to view starred resumes');
      },
      onSuccess: (data) => {
        setResumes(data);
      },
      retry: false,
    },
  );
  const myResumesQuery = trpc.useQuery(
    ['resumes.resume.user.findUserCreated'],
    {
      enabled: tabsValue === BROWSE_TABS_VALUES.MY,
      onError: () => {
        setResumes([]);
        setRenderSignInButton(true);
        setSignInButtonText('to view your submitted resumes');
      },
      onSuccess: (data) => {
        setResumes(data);
      },
      retry: false,
    },
  );

  const onClickNew = () => {
    if (sessionData?.user?.id) {
      router.push('/resumes/submit');
    } else {
      router.push('/api/auth/signin');
    }
  };

  return (
    <>
      <Head>
        <title>Resume Review Portal</title>
      </Head>
      <main className="h-[calc(100vh-4rem)] flex-1 overflow-y-scroll">
        <div className="ml-4 py-4">
          <ResumeReviewsTitle />
        </div>
        <div className="mt-4 flex items-start">
          <div className="w-screen sm:px-4 md:px-8">
            <div className="grid grid-cols-12">
              <div className="col-span-2 self-end">
                <h1 className="mb-4 tracking-tight text-gray-900">Filters</h1>
              </div>
              <div className="col-span-10">
                <div className="border-grey-200 grid grid-cols-12 items-center gap-4 border-b pb-2">
                  <div className="col-span-7">
                    <Tabs
                      label="Resume Browse Tabs"
                      tabs={[
                        {
                          label: 'All Resumes',
                          value: BROWSE_TABS_VALUES.ALL,
                        },
                        {
                          label: 'Starred Resumes',
                          value: BROWSE_TABS_VALUES.STARRED,
                        },
                        {
                          label: 'My Resumes',
                          value: BROWSE_TABS_VALUES.MY,
                        },
                      ]}
                      value={tabsValue}
                      onChange={setTabsValue}
                    />
                  </div>
                  <div className="col-span-3 self-end">
                    <form>
                      <TextInput
                        label=""
                        placeholder="Search Resumes"
                        startAddOn={MagnifyingGlassIcon}
                        startAddOnType="icon"
                        type="text"
                        value={searchValue}
                        onChange={setSearchValue}
                      />
                    </form>
                  </div>
                  <div className="col-span-1 justify-self-center">
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        {/* TODO: Sort logic */}
                        <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                          Sort
                          <ChevronDownIcon
                            aria-hidden="true"
                            className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                          />
                        </Menu.Button>
                      </div>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            {SORT_OPTIONS.map((option) => (
                              <Menu.Item key={option.name}>
                                {({ active }) => (
                                  <a
                                    className={clsx(
                                      option.current
                                        ? 'font-medium text-gray-900'
                                        : 'text-gray-500',
                                      active ? 'bg-gray-100' : '',
                                      'block px-4 py-2 text-sm',
                                    )}
                                    href={option.href}>
                                    {option.name}
                                  </a>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                  <div className="col-span-1">
                    <button
                      className="rounded-md bg-indigo-500 py-1 px-3 text-sm text-white"
                      type="button"
                      onClick={onClickNew}>
                      New
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-2">
                <div className="w-100 pt-4 sm:pr-0 md:pr-4">
                  <form>
                    <h3 className="sr-only">Categories</h3>
                    <ul
                      className="flex flex-wrap justify-start gap-4 pb-6 text-sm font-medium text-gray-900"
                      role="list">
                      {TOP_HITS.map((category) => (
                        <li key={category.name}>
                          {/* TODO: Replace onClick with filtering function */}
                          <ResumeFilterPill
                            title={category.name}
                            onClick={() => true}
                          />
                        </li>
                      ))}
                    </ul>

                    {filters.map((section) => (
                      <Disclosure
                        key={section.id}
                        as="div"
                        className="border-b border-gray-200 py-6">
                        {({ open }) => (
                          <>
                            <h3 className="-my-3 flow-root">
                              <Disclosure.Button className="flex w-full items-center justify-between py-3 text-sm text-gray-400 hover:text-gray-500">
                                <span className="font-medium text-gray-900">
                                  {section.name}
                                </span>
                                <span className="ml-6 flex items-center">
                                  {open ? (
                                    <MinusIcon
                                      aria-hidden="true"
                                      className="h-5 w-5"
                                    />
                                  ) : (
                                    <PlusIcon
                                      aria-hidden="true"
                                      className="h-5 w-5"
                                    />
                                  )}
                                </span>
                              </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel className="pt-6">
                              <div className="space-y-4">
                                {section.options.map((option, optionIdx) => (
                                  <div
                                    key={option.value}
                                    className="flex items-center">
                                    <input
                                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                      defaultChecked={option.checked}
                                      defaultValue={option.value}
                                      id={`filter-${section.id}-${optionIdx}`}
                                      name={`${section.id}[]`}
                                      type="checkbox"
                                    />
                                    <label
                                      className="ml-3 text-sm text-gray-600"
                                      htmlFor={`filter-${section.id}-${optionIdx}`}>
                                      {option.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    ))}
                  </form>
                </div>
              </div>
              <div className="col-span-10 pr-8">
                {renderSignInButton && (
                  <ResumeSignInButton text={signInButtonText} />
                )}
                <ResumeListItems
                  isLoading={
                    allResumesQuery.isFetching ||
                    starredResumesQuery.isFetching ||
                    myResumesQuery.isFetching
                  }
                  resumes={resumes}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
