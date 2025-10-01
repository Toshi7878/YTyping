export const scrollMapTable = ({ rowIndex }: { rowIndex: number }) => {
  const tbody = document.getElementById("map-table-tbody");
  if (!tbody) return;
  const rows = tbody.children;

  const targetRow = rows[rowIndex];

  if (targetRow && targetRow instanceof HTMLTableRowElement) {
    const tableCard = targetRow.closest<HTMLDivElement>("#map-table-card");
    if (tableCard) {
      tableCard.scrollTo({
        top: targetRow.offsetTop - tableCard.offsetTop - targetRow.offsetHeight,
        behavior: "smooth",
      });
    }
  }
};
