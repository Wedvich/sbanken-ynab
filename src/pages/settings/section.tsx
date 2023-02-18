import { ComponentChildren, h } from 'preact';

interface SectionProps {
  children: ComponentChildren;
  title: string;
  description?: string | h.JSX.Element;
  id?: string;
}

export const Section = ({ children, title, description, id }: SectionProps) => {
  return (
    <div className="mt-8" id={id}>
      <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded">
            <div className="bg-gray-50 py-3 px-4">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {description && <p className="mt-2 text-sm text-gray-700">{description}</p>}
            </div>
            <div className="border-t border-gray-300 bg-white p-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
