import { AddItemSheet } from "./components/AddItemSheet";
import { Header } from "./components/Header";
import { Panel } from "./components/Panel";
import { WishList } from "./components/WishList";

export function App(): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-4 pt-6 pb-24 sm:px-6 sm:pt-10 sm:pb-28 lg:max-w-5xl">
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
