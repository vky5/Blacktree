type StepProps = {
  no: number;
  active: boolean;
};

function Steps({ no, active }: StepProps) {
return (
    <span
        className={`flex items-center justify-center w-10 h-10 ${active ? "bg-priBlue" : "bg-emerald-900/55"} rounded-full`}
    >
        {no}
    </span>
);
}

export default Steps;
