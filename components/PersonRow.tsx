import Link from "next/link";

interface Props {
  id: string;
  name: string;
  phone: string;
  /** Shown after the number, for example the city. Optional. */
  detail?: string;
}

export default function PersonRow({ id, name, phone, detail }: Props) {
  return (
    <li>
      <Link
        href={`/dashboard/person/${id}`}
        className="block rounded-lg bg-white px-4 py-3 shadow-sm"
      >
        <p className="text-base font-medium break-words">{name}</p>
        <p className="text-sm break-words text-stone-600">
          {phone || "No phone number"}
          {detail ? ` · ${detail}` : ""}
        </p>
      </Link>
    </li>
  );
}
