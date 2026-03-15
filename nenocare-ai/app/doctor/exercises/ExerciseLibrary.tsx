"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PatientOption = {
  id: string;
  label: string;
};

type ExerciseItem = {
  id: string;
  name: string;
  bodyPart?: string;
  target?: string;
  gifUrl?: string;
};

type Props = {
  patients: PatientOption[];
  createPrescription: (formData: FormData) => Promise<void>;
};

export default function ExerciseLibrary({ patients, createPrescription }: Props) {
  const [items, setItems] = useState<ExerciseItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const canPrescribe = useMemo(
    () => Boolean(selectedPatient && selectedExercise),
    [selectedPatient, selectedExercise]
  );

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) {
        params.set("search", search);
      }
      const response = await fetch(`/api/exercises?${params.toString()}`);
      const data = await response.json();
      setItems(data.items || []);
      setLoading(false);
    };

    run();
  }, [search]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canPrescribe || !selectedExercise) {
      return;
    }

    const formData = new FormData();
    formData.set("patientId", selectedPatient);
    formData.set("exerciseId", selectedExercise.id);
    formData.set("name", selectedExercise.name);
    formData.set("gifUrl", selectedExercise.gifUrl || "");
    formData.set("bodyPart", selectedExercise.bodyPart || "");
    formData.set("target", selectedExercise.target || "");

    await createPrescription(formData);
    setSelectedExercise(null);
  };

  return (
    <section className="mt-6">
      <Card className="glass card-lift">
        <CardHeader>
          <CardTitle>Prescribe Exercises</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search exercises"
            className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm"
          />
          <select
            value={selectedPatient}
            onChange={(event) => setSelectedPatient(event.target.value)}
            className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm"
          >
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canPrescribe}
          >
            Prescribe Selected
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <p className="mt-6 text-sm text-mutedForeground">Loading exercises...</p>
      ) : (
        <motion.div
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {items.map((exercise) => (
            <motion.button
              key={exercise.id}
              type="button"
              onClick={() => setSelectedExercise(exercise)}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
              }}
              className={`card-lift rounded-xl border px-4 py-4 text-left transition ${
                selectedExercise?.id === exercise.id
                  ? "border-sky-400/60 bg-sky-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <p className="text-base font-semibold capitalize">
                {exercise.name}
              </p>
              <p className="mt-1 text-xs text-mutedForeground">
                {exercise.bodyPart} · {exercise.target}
              </p>
              {exercise.gifUrl ? (
                <img
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  className="mt-3 w-full rounded-lg"
                />
              ) : null}
            </motion.button>
          ))}
        </motion.div>
      )}
    </section>
  );
}
