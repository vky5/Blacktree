type TagProps = {
  children: React.ReactNode;
};

function Tag({ children }: TagProps) {
  return (
    <span className="px-3 py-1 text-xs font-semibold text-white rounded-full bg-[linear-gradient(to_right,#00986A,#09998C)]">
      {children}
    </span>
  );
}

export default Tag;
