import { AddItemSheet } from "./components/AddItemSheet";
import { Header } from "./components/Header";
import { Panel } from "./components/Panel";
import { WishList } from "./components/WishList";

export function App(): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10 lg:max-w-5xl">
      <Header />
      <main className="flex flex-col gap-8">
        <Panel>
          <WishList />
        </Panel>
      </main>
      <AddItemSheet />
    </div>
  );
}
