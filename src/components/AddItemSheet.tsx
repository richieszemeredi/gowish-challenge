import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { AddItemForm } from "./AddItemForm";
import { Toast } from "./Toast";

export function AddItemSheet(): React.JSX.Element {
  const dialog = useRef<HTMLDialogElement>(null);
  const [added, setAdded] = useState(0);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="fixed right-4 bottom-4 z-10 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/70 bg-mint-soft py-3 pr-5 pl-4 font-display font-bold tracking-tight shadow-soft transition-colors duration-200 hover:bg-mint sm:right-6 sm:bottom-6"
      >
        <Plus aria-hidden="true" className="size-5" />
        New wish
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="add-wish-title"
        className="mt-auto mb-0 w-full max-w-none translate-y-full rounded-t-card border border-white/70 bg-card p-5 text-ink opacity-0 shadow-soft transition-[translate,opacity,display,overlay] transition-discrete duration-300 backdrop:bg-ink/30 open:translate-y-0 open:opacity-100 motion-reduce:transition-none sm:m-auto sm:max-w-md sm:rounded-card sm:p-7 starting:open:translate-y-full starting:open:opacity-0"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2
            id="add-wish-title"
            className="font-display text-xl font-bold tracking-tight"
          >
            New wish
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => dialog.current?.close()}
            className="cursor-pointer rounded-full p-2 transition-colors duration-200 hover:bg-paper-deep"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <AddItemForm
          onAdded={() => {
            dialog.current?.close();
            setAdded((n) => n + 1);
          }}
        />
      </dialog>
      <p
        role="status"
        className="pointer-events-none fixed right-4 bottom-20 z-10 sm:right-6 sm:bottom-24"
      >
        {added > 0 ? <Toast key={added}>Wish added.</Toast> : null}
      </p>
    </>
  );
}
