import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg";
  isOnline?: boolean;
}

const sizeClasses = {
  xs: "w-8 h-8",
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export default function Avatar({
  src,
  alt,
  size = "md",
  isOnline,
}: AvatarProps) {
  const initials = alt
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {src ? (
        <Image src={src} alt={alt} fill className="rounded-full object-cover" />
      ) : (
        <div
          className={`${sizeClasses[size]} bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center`}
        >
          <span className="text-white font-semibold text-sm">{initials}</span>
        </div>
      )}

      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
            isOnline ? "bg-green-500" : " bg-gray-400"
          }`}
        />
      )}
    </div>
  );
}
