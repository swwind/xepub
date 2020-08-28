
export interface KeyMap<T> {
  [key: string]: T;
}

export interface EpubInfo {
  metadata: Metadata;
  manifest: KeyMap<string>;
  spine: string[];
  docTitle: string;
  docAuthor: string;
  navMap: NavPoint[];
  sizes: KeyMap<Size>;
}

export interface Size {
  width: number;
  height: number;
}

export interface Metadata {
  // required
  title: string;
  language: string;
  identifier: string;

  // optional
  creator?: string;
  contributor?: string;
  subject?: string;
  description?: string;
  date?: string;
  type?: string;
  format?: string;
  source?: string;
  relation?: string;
  coverage?: string;
  rights?: string;
}

export interface NavPoint {
  child: NavPoint[];
  label: string;
  src: string;
}
