export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-background py-6">
      <p className="text-center text-[13px] text-text-tertiary">
        &copy; {year} 北行之路
      </p>
    </footer>
  );
}
