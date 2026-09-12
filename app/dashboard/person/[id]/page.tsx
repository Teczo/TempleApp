import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PersonForm from "@/components/PersonForm";
import { findAttendeeById } from "@/lib/db/attendees";
import { findCityById } from "@/lib/db/cities";
import { findCountry } from "@/lib/utils/countries";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const person = await findAttendeeById(id).catch(() => null);
  return { title: person ? person.name : "Person" };
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params;

  const person = await findAttendeeById(id).catch(() => null);
  if (!person) notFound();

  const city = person.cityId
    ? await findCityById(person.cityId.toString()).catch(() => null)
    : null;

  const backHref = city ? `/dashboard/city/${city._id.toString()}` : "/dashboard";

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <Link href={backHref} className="text-sm text-stone-600 underline">
        Back
      </Link>

      <h1 className="mt-3 text-2xl font-semibold">{person.name}</h1>
      {person.status === "removed" && (
        <p className="mt-2 rounded-lg bg-stone-200 px-3 py-2 text-base text-stone-700">
          This person is off the list. Saving changes puts them back on it.
        </p>
      )}

      <PersonForm
        person={{
          id: person._id.toString(),
          name: person.name,
          phoneLocal: localPart(person.phone, person.countryCode),
          countryCode: person.countryCode,
          city: city ? city.name : person.cityRaw,
          cityId: city && city.status === "approved" ? city._id.toString() : "",
          backHref,
        }}
      />
    </main>
  );
}

/** The form shows the dialling code on its own, so take it off the number. */
function localPart(phone: string, countryCode: string): string {
  const country = findCountry(countryCode);
  if (!phone || !country) return phone;
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith(country.dialCode)
    ? digits.slice(country.dialCode.length)
    : digits;
}
