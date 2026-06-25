import Link from "next/link";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { formatCurrency } from "@/src/lib/format";

interface ArtCardProps {
  id: string;
  title: string;
  image: string;
  price: number;
  artistName: string;
  liked?: boolean;
  onLike?: () => void;
  onAdd?: () => void;
}

export function ArtCard({ id, title, image, price, artistName, liked, onLike, onAdd }: ArtCardProps) {
  return (
    <div className="group overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/art/${id}`} className="block aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
            <p className="text-sm text-zinc-500">by {artistName}</p>
          </div>
          <span className="text-sm font-semibold text-zinc-900">{formatCurrency(price)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={onLike} className="inline-flex items-center gap-2 text-sm text-zinc-700 transition hover:text-black">
            <Heart size={18} className={liked ? "text-red-500" : ""} />
            Like
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-900">
              <ShoppingCart size={14} />
              Add
            </button>
            <Link href={`/art/${id}`} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-black hover:text-black">
              <Eye size={14} />
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
