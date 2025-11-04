import Image from "next/image";

interface CardProps {
  image: string;
  name: string;
  role: string;
}

const ProfileCard = ({ image, name, role }: CardProps) => {
  return (
    <div className="relative w-72 h-96 flex flex-col items-center justify-end rounded-lg overflow-hidden">
      {/* Background shape */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg rotate-45 w-[1000px]" />

      {/* Foto */}
      <div className="relative w-full flex justify-center -mt-6">
        <Image
          src={image}
          alt={name}
          width={250}
          height={250}
          className="object-contain z-10"
        />
      </div>

      {/* Teks */}
      <div className="z-10 text-center mb-4">
        <h3 className="font-bold text-white text-lg italic">{role}</h3>
        <p className="text-white text-sm">{name}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
