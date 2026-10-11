import { AddItemForm } from "./components/AddItemForm";
import { Header } from "./components/Header";
import { Panel } from "./components/Panel";
import { WishList } from "./components/WishList";

export function App(): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10">
      <Header />
      <main className="flex flex-col gap-8">
        <Panel>
          <AddItemForm />
        </Panel>
        <Panel>
          <WishList />
        </Panel>
      </main>
    </div>
  );
}
