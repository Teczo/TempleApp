import Link from "next/link";

interface Props {
  cityId: string | null;
  cityName: string;
  status: "approved" | "pending" | "none";
  count: number;
}

export default function CityRow({ cityId, cityName, status, count }: Props) {
  const inside = (
    <>
      <span className="min-w-0 text-base font-medium break-words">
        {cityName}
        {status === "pending" && (
          <span className="block text-sm font-normal text-amber-700">needs checking</span>
        )}
      </span>
      <span className="shrink-0 text-base text-stone-600">{count}</span>
    </>
  );

  const boxClass = "flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-4 shadow-sm";

  return (
    <li>
      {cityId ? (
        <Link href={`/dashboard/city/${cityId}`} className={boxClass}>
          {inside}
        </Link>
      ) : (
        <div className={`${boxClass} text-stone-500`}>{inside}</div>
      )}
    </li>
  );
}
