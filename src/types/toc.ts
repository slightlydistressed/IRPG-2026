export type TocItemKind = "section" | "entry" | "checklist-link" | "external-link";

export interface TocPageRef {
  pageNumber: number;
  pageLabel?: string;
}

export interface TocBaseItem {
  id: string;
  title: string;
  shortTitle?: string;
  kind: TocItemKind;
  description?: string;
  icon?: string;
  tags?: string[];
}

export interface TocSectionItem extends TocBaseItem {
  kind: "section";
  children: TocItem[];
  expandedByDefault?: boolean;
}

export interface TocEntryItem extends TocBaseItem {
  kind: "entry";
  page: TocPageRef;
}

export interface TocChecklistLinkItem extends TocBaseItem {
  kind: "checklist-link";
  checklistId: string;
}

export interface TocExternalLinkItem extends TocBaseItem {
  kind: "external-link";
  href: string;
  openInNewTab?: boolean;
}

export type TocItem = TocSectionItem | TocEntryItem | TocChecklistLinkItem | TocExternalLinkItem;

export interface TocDocument {
  documentId: string;
  title: string;
  version?: string;
  updatedAt?: string;
  items: TocItem[];
}

export interface TocSearchResult {
  itemId: string;
  title: string;
  breadcrumb: string[];
  pageNumber?: number;
  checklistId?: string;
  score?: number;
}

export interface BookmarkRecord {
  id: string;
  documentId: string;
  tocItemId: string;
  title: string;
  pageNumber?: number;
  createdAt: string;
  updatedAt: string;
  note?: string;
}
