const MapCardLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>;
};

export default MapCardLayout;
