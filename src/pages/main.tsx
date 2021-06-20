import { h } from 'preact';

export const MainPage = () => {
  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto" />
        </div>
        <div>Hmm</div>
      </div>
    </div>
  );
};
