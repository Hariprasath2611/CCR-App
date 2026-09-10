export const matchFacultyName = (slotFacultyName?: string, userName?: string): boolean => {
  if (!slotFacultyName || !userName) return false;

  const s = slotFacultyName.trim();
  const u = userName.trim();

  // Exact match
  if (s === u) return true;

  // Clean strings by removing dots, spaces, special chars and converting to lowercase
  const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const sClean = clean(s);
  const uClean = clean(u);

  if (sClean === uClean) return true;

  // Strip common titles (dr, mrs, mr, ms, prof) for name matching
  const stripTitle = (cleanStr: string) => cleanStr.replace(/^(dr|mrs|mr|ms|prof)/i, '');

  const sCore = stripTitle(sClean);
  const uCore = stripTitle(uClean);

  if (sCore && uCore && sCore === uCore) return true;

  // Check if core names contain each other (e.g. "thirugnanam" in "drthirugnanam")
  if (sCore.length >= 3 && uCore.length >= 3) {
    if (sCore.includes(uCore) || uCore.includes(sCore)) return true;
  }

  return false;
};
