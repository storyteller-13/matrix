/**
 * Builds one list entry for the lists folder tree. Shared by every folder file.
 * Opening a list goes through the books window, resolved at call time so it can load later.
 */
export const listEntry = (id, label, extra = {}) => ({
    id,
    label,
    kind: 'list',
    ...extra,
    open: () => window.openBooksWindow?.(id),
});
