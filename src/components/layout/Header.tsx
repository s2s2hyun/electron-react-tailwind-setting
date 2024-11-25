export default function Header() {
  return (
    <div
      data-drag="true"
      className="draggable w-full h-8 bg-transparent text-white flex items-center justify-between px-4 absolute top-1 z-10 "
    >
      <span className="font-semibold text-sm">Electron App</span>
      <div className="flex space-x-2">{/* <a to="/"></a> */}</div>
    </div>
  );
}
