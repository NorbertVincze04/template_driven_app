export interface ShopRecord {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  config: Record<string, unknown>;
}
