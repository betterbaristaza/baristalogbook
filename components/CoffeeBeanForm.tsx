import React, { useEffect, useRef, useState } from 'react';
import { CoffeeBean, RoastLevel } from '../types';

interface CoffeeBeanFormProps {
  onSave: (bean: CoffeeBean) => void | Promise<void>;
  onCancel: () => void;
  initialData?: CoffeeBean;
}

const CoffeeBeanForm: React.FC<CoffeeBeanFormProps> = ({
  onSave,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<CoffeeBean>>(
    initialData || {
      name: '',
      roaster: '',
      roasterLocation: '',
      origin: '',
      region: '',
      farm: '',
      producer: '',
      process: 'Washed',
      varietal: '',
      altitude: '',
      roastLevel: RoastLevel.LIGHT,
      roastDate: new Date().toISOString().split('T')[0],
      purchaseDate: new Date().toISOString().split('T')[0],
      totalWeight: 250,
      remainingWeight: 250,
      bagTastingNotes: [],
      personalNotes: '',
      bagImage: undefined,
      labelImage: undefined,
      bagImageFile: undefined,
      labelImageFile: undefined,
    }
  );

  const [tastingNoteInput, setTastingNoteInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const bagInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (formData.bagImage?.startsWith('blob:')) {
        URL.revokeObjectURL(formData.bagImage);
      }

      if (formData.labelImage?.startsWith('blob:')) {
        URL.revokeObjectURL(formData.labelImage);
      }
    };
  }, []);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'bagImage' | 'labelImage'
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Please select an image smaller than 15 MB.');
      event.target.value = '';
      return;
    }

    const fileField =
      type === 'bagImage' ? 'bagImageFile' : 'labelImageFile';

    const previewUrl = URL.createObjectURL(file);

    setFormData((previous) => {
      const previousPreview = previous[type];

      if (previousPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(previousPreview);
      }

      return {
        ...previous,
        [type]: previewUrl,
        [fileField]: file,
      };
    });

    event.target.value = '';
  };

  const handleAddTastingNote = () => {
    const note = tastingNoteInput.trim();

    if (!note) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      bagTastingNotes: [...(previous.bagTastingNotes || []), note],
    }));

    setTastingNoteInput('');
  };

  const handleTastingNoteKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTastingNote();
    }
  };

  const handleRemoveTastingNote = (noteIndex: number) => {
    setFormData((previous) => ({
      ...previous,
      bagTastingNotes: previous.bagTastingNotes?.filter(
        (_, index) => index !== noteIndex
      ),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();

  if (isSaving) {
    return;
  }

  if (!formData.name || !formData.roaster) {
    return;
  }

  setIsSaving(true);

  try {
    const totalWeight = Number(formData.totalWeight) || 250;

    await onSave({
      ...(formData as CoffeeBean),
      id:
        initialData?.id ||
        Math.random().toString(36).substring(2, 11),
      totalWeight,
      remainingWeight: initialData
        ? Number(formData.remainingWeight)
        : totalWeight,
    });
  } finally {
    setIsSaving(false);
  }
};
  return (
    <form
  onSubmit={handleSubmit}
  className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl overflow-y-auto rounded-none sm:rounded-3xl px-5 pb-5 sm:p-8 shadow-2xl space-y-6 sm:space-y-8 space-yanimate-in zoom-in-95 duration-300 [&_input]:text-base [&_select]:text-base [&_textarea]:text-base sm:[&_input]:text-sm sm:[&_select]:text-sm sm:[&_textarea]:text-sm"
  style={{
    paddingTop: 'calc(env(safe-area-inset-top) + 1.25rem)',
  }}
>
      <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold display-font text-stone-800 leading-tight">
            {initialData ? 'Edit Bean Record' : 'New Bean Record'}
          </h2>

          <p className="mt-1 text-sm font-medium text-stone-400">
            {initialData
              ? 'Update the details for this coffee'
              : 'Capture every detail from the label'}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded-full bg-stone-50 p-2 text-stone-400 transition-colors hover:text-stone-800"
          aria-label="Close form"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <section className="space-y-4">
          <h3 className="border-l-2 border-amber-800 pl-3 text-[10px] font-black uppercase tracking-widest text-amber-800">
            Visual Documentation
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0 space-y-2">
              <label className="block text-[10px] font-bold uppercase text-stone-400">
                Front of Bag
              </label>

              <button
                type="button"
                onClick={() => bagInputRef.current?.click()}
                className="group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 transition-colors hover:border-amber-300"
              >
                {formData.bagImage ? (
                  <>
                    <img
                      src={formData.bagImage}
                      alt="Front of coffee bag"
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-xs font-bold uppercase tracking-widest text-white">
                        Change Photo
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <svg
                      className="mb-2 h-8 w-8 text-stone-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>

                    <p className="text-center text-[9px] font-bold uppercase text-stone-400 sm:text-[10px]">
                      Front of Bag
                    </p>
                  </>
                )}
              </button>

              <input
                ref={bagInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) =>
                  handleImageUpload(event, 'bagImage')
                }
              />
            </div>

            <div className="min-w-0 space-y-2">
              <label className="block text-[10px] font-bold uppercase text-stone-400">
                Back of Bag
              </label>

              <button
                type="button"
                onClick={() => labelInputRef.current?.click()}
                className="group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 transition-colors hover:border-amber-300"
              >
                {formData.labelImage ? (
                  <>
                    <img
                      src={formData.labelImage}
                      alt="Back of coffee bag"
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-xs font-bold uppercase tracking-widest text-white">
                        Change Photo
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <svg
                      className="mb-2 h-8 w-8 text-stone-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>

                    <p className="text-center text-[9px] font-bold uppercase text-stone-400 sm:text-[10px]">
                      Back / Label
                    </p>
                  </>
                )}
              </button>

              <input
                ref={labelInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) =>
                  handleImageUpload(event, 'labelImage')
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="border-l-2 border-amber-800 pl-3 text-[10px] font-black uppercase tracking-widest text-amber-800">
            Bean Identity
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-stone-400">
                Coffee Name
              </label>

              <input
                name="name"
                required
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 font-bold"
                placeholder="e.g. Ethiopia Sidamo"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-stone-400">
                Roaster
              </label>

              <input
                name="roaster"
                required
                value={formData.roaster || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 font-bold"
                placeholder="e.g. Onyx Coffee Lab"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="border-l-2 border-amber-800 pl-3 text-[10px] font-black uppercase tracking-widest text-amber-800">
            Terroir & Origin
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-stone-400">
                Country / Origin
              </label>

              <input
                name="origin"
                value={formData.origin || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3"
                placeholder="e.g. Colombia"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-stone-400">
                Region
              </label>

              <input
                name="region"
                value={formData.region || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3"
                placeholder="e.g. Huila"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-stone-400">
                Farm / Estate
              </label>

              <input
                name="farm"
                value={formData.farm || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3"
                placeholder="e.g. Finca El Diviso"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-stone-400">
                Altitude (MASL)
              </label>

              <input
                name="altitude"
                value={formData.altitude || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3"
                placeholder="e.g. 1750 - 1900m"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-bold uppercase text-stone-400">
                Process Method
              </label>

              <input
                name="process"
                value={formData.process || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3"
                placeholder="e.g. Natural, Washed, Anaerobic Fermentation"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="border-l-2 border-amber-800 pl-3 text-[10px] font-black uppercase tracking-widest text-amber-800">
            Roast & Purchase
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-stone-400">
                Roast Level
              </label>

              <select
                name="roastLevel"
                value={formData.roastLevel}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 font-bold"
              >
                {Object.values(RoastLevel).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-stone-400">
                Roast Date
              </label>

              <input
                name="roastDate"
                type="date"
                value={formData.roastDate || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-stone-400">
                Bag Weight (g)
              </label>

              <input
                name="totalWeight"
                type="number"
                min="1"
                value={formData.totalWeight || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 font-bold"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="border-l-2 border-amber-800 pl-3 text-[10px] font-black uppercase tracking-widest text-amber-800">
            Sensory & Labels
          </h3>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-stone-400">
              Tasting Notes (on bag)
            </label>

            <div className="mb-2 flex gap-2">
              <input
                value={tastingNoteInput}
                onChange={(event) =>
                  setTastingNoteInput(event.target.value)
                }
                onKeyDown={handleTastingNoteKeyDown}
                className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 p-3"
                placeholder="Add a note from the label..."
              />

              <button
                type="button"
                onClick={handleAddTastingNote}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-800 text-base font-bold text-white"
                aria-label="Add tasting note"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.bagTastingNotes?.map((note, index) => (
                <span
                  key={`${note}-${index}`}
                  className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900"
                >
                  {note}

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveTastingNote(index)
                    }
                    aria-label={`Remove ${note}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-stone-400">
              Initial Impression / Notes
            </label>

            <textarea
              name="personalNotes"
              value={formData.personalNotes || ''}
              onChange={handleChange}
              className="h-28 w-full resize-y rounded-xl border border-stone-200 bg-stone-50 p-3"
              placeholder="Any details not on the bag? Smells, price, etc."
            />
          </div>
        </section>
      </div>

      <div className="-mx-5 flex gap-3 border-t border-stone-100 bg-white px-5 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:mx-0 sm:gap-4 sm:px-0 sm:pt-6 sm:pb-0">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-2xl bg-stone-100 py-4 text-xs font-black uppercase tracking-widest text-stone-600 transition-all hover:bg-stone-200"
        >
          Discard
        </button>

        <button
  type="submit"
  disabled={isSaving}
  className="flex-1 rounded-2xl bg-amber-800 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-amber-900/20 transition-all hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
>
  {isSaving
    ? 'Saving...'
    : initialData
      ? 'Update Record'
      : 'Save to Library'}
</button>
      </div>
    </form>
  );
};

export default CoffeeBeanForm;