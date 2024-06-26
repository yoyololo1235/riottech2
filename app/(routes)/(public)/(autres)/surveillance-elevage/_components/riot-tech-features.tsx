const RiotTechFeatures = () => {
  const features = [
    "Visionnez vos cameras en direct et en différé sur votre smartphone ou tablette de n’importe où, sans limite de distance !",
    "Soyez alerté en temps réel d’eventuelles intrusions sur votre smartphone, sans nécessiter d’abonnement !",
    "En fessant confiance à RIOT TECH pour vos cameras, vous faites aussi confiance à un expert réseaux pour raccorder vos bâtiments à internet (Cf.)",
    "Faites confiance à un acteur local qui répondra à tout vos problèmes.",
    "La garantie 2 ans équipement, SAV et déplacement compris 100% gratuit et au-delà, support et assistance à distance GRATUIT à vie !",
  ];

  return (
    <div className=" mx-auto mb-10 max-w-4xl  rounded-lg  p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-semibold ">Les plus RIOT TECH:</h2>
      <ul className="space-y-3 list-image-check-circle-green-500">
        {features.map((feature, index) => (
          <li key={index} className=" flex items-start before:self-center">
            <p className="text-md ">{feature}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RiotTechFeatures;
