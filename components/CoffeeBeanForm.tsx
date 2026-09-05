import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  CoffeeBean,
  RoastLevel,
} from '../types';

import { useEntitlements } from '../context/EntitlementContext';

interface CoffeeBeanFormProps {
  onSave: (
    bean: CoffeeBean
  ) => void | Promise<void>;
  onCancel: () => void;
  initialData?: CoffeeBean;
}

const CoffeeBeanForm: React.FC<
  CoffeeBeanFormProps
> = ({
  onSave,
  onCancel,
  initialData,
}) => {
  const {
    isPro,
    loading: entitlementsLoading,
  } = useEntitlements();

  const [formData, setFormData] =
    useState<Partial<CoffeeBean>>(
      initialData || {
        name: '',
        roaster: '',
        roasterLocation: '',
        roasterURL: '',
        origin: '',
        region: '',
        farm: '',
        producer: '',
        process: 'Washed',
        varietal: '',
        altitude: '',
        terroir: '',
        harvestSeason: '',
        roastLevel: RoastLevel.LIGHT,
        roastDate: new Date()
          .toISOString()
          .split('T')[0],
        purchaseDate: new Date()
          .toISOString()
          .split('T')[0],
        totalWeight: 250,
        remainingWeight: 250,
        price: undefined,
        bagTastingNotes: [],
        personalNotes: '',
        bagImage: undefined,
        labelImage: undefined,
        bagImageFile: undefined,
        labelImageFile: undefined,
      }
    );

  const [
    tastingNoteInput,
    setTastingNoteInput,
  ] = useState('');

  const [isSaving, setIsSaving] =
    useState(false);

  const bagInputRef =
    useRef<HTMLInputElement>(null);

  const labelInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (
        formData.bagImage?.startsWith(
          'blob:'
        )
      ) {
        URL.revokeObjectURL(
          formData.bagImage
        );
      }

      if (
        formData.labelImage?.startsWith(
          'blob:'
        )
      ) {
        URL.revokeObjectURL(
          formData.labelImage
        );
      }
    };
  }, []);

  const handleChange = (
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) => {
    const {
      name,
      value,
      type,
    } = event.target;

    const isNumberField =
      type === 'number';

    setFormData(previous => ({
      ...previous,
      [name]: isNumberField
        ? value === ''
          ? ''
          : Number(value)
        : value,
    }));
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'bagImage' | 'labelImage'
  ) => {
    if (
      type === 'labelImage' &&
      !isPro
    ) {
      alert(
        'Rear label photos are available with Brewprint Pro.'
      );

      event.target.value = '';
      return;
    }

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith('image/')
    ) {
      alert(
        'Please select an image file.'
      );

      event.target.value = '';
      return;
    }

    if (
      file.size >
      15 * 1024 * 1024
    ) {
      alert(
        'Please select an image smaller than 15 MB.'
      );

      event.target.value = '';
      return;
    }

    const fileField =
      type === 'bagImage'
        ? 'bagImageFile'
        : 'labelImageFile';

    const previewUrl =
      URL.createObjectURL(file);

    setFormData(previous => {
      const previousPreview =
        previous[type];

      if (
        previousPreview?.startsWith(
          'blob:'
        )
      ) {
        URL.revokeObjectURL(
          previousPreview
        );
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
    const note =
      tastingNoteInput.trim();

    if (!note) {
      return;
    }

    setFormData(previous => ({
      ...previous,
      bagTastingNotes: [
        ...(previous.bagTastingNotes ||
          []),
        note,
      ],
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

  const handleRemoveTastingNote = (
    noteIndex: number
  ) => {
    setFormData(previous => ({
      ...previous,
      bagTastingNotes:
        previous.bagTastingNotes?.filter(
          (_, index) =>
            index !== noteIndex
        ),
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    if (
      !formData.name ||
      !formData.roaster
    ) {
      return;
    }

    const totalWeight =
      Number(formData.totalWeight) ||
      250;

    const remainingWeight =
      initialData
        ? Number(
            formData.remainingWeight
          )
        : totalWeight;

    if (
      initialData &&
      remainingWeight >
        totalWeight
    ) {
      alert(
        'Remaining weight cannot be greater than the total bag weight.'
      );

      return;
    }

    if (remainingWeight < 0) {
      alert(
        'Remaining weight cannot be below 0g.'
      );

      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        ...(formData as CoffeeBean),
        id:
          initialData?.id ||
          Math.random()
            .toString(36)
            .substring(2, 11),
        totalWeight,
        remainingWeight,
        price:
          formData.price === '' ||
          formData.price === undefined
            ? undefined
            : Number(formData.price),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="h-[100dvh] w-full overflow-y-auto bg-[var(--bp-paper)] px-4 pb-6 sm:h-auto sm:max-h-[92vh] sm:max-w-2xl sm:border sm:border-[var(--bp-line)] sm:px-6 sm:pb-6 [&_input]:text-base [&_select]:text-base [&_textarea]:text-base sm:[&_input]:text-sm sm:[&_select]:text-sm sm:[&_textarea]:text-sm"
      style={{
        paddingTop:
          'calc(env(safe-area-inset-top) + 1rem)',
      }}
    >
      <div className="sticky top-0 z-20 -mx-4 mb-8 border-b border-[var(--bp-line)] bg-[var(--bp-paper)] px-4 pb-4 sm:-mx-6 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="bp-index">
              04 / COFFEE RECORD
            </p>

            <h2 className="bp-heading mt-1 text-2xl text-[var(--bp-blue)]">
              {initialData
                ? 'Edit Coffee'
                : 'Add Coffee'}
            </h2>

            <p className="bp-code mt-2 text-[var(--bp-muted)]">
              {initialData
                ? 'Update the stored coffee record.'
                : 'Capture the coffee record before brewing.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="bp-button h-10 min-h-0 px-3"
          >
            Close
          </button>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <div className="mb-4">
            <p className="bp-index">
              04.01 / DOCUMENTATION
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Bag Reference
            </h3>
          </div>

          <div className="grid grid-cols-2 border border-[var(--bp-line)]">
            <div className="border-r border-[var(--bp-line)] p-3">
              <p className="bp-label mb-3 text-[var(--bp-muted)]">
                Front of Bag
              </p>

              <button
                type="button"
                onClick={() =>
                  bagInputRef.current?.click()
                }
                className="group relative flex aspect-square w-full items-center justify-center overflow-hidden border border-[var(--bp-line)] bg-[var(--bp-paper-light)]"
              >
                {formData.bagImage ? (
                  <>
                    <img
                      src={
                        formData.bagImage
                      }
                      alt="Front of coffee bag"
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-[rgba(12,39,72,0.55)] opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="bp-label text-white">
                        Change image
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <svg
                      className="mx-auto h-7 w-7 text-[var(--bp-muted)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>

                    <p className="bp-code mt-3 text-[var(--bp-muted)]">
                      Add image
                    </p>
                  </div>
                )}
              </button>

              <input
                ref={bagInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={event =>
                  handleImageUpload(
                    event,
                    'bagImage'
                  )
                }
              />
            </div>

            <div className="p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="bp-label text-[var(--bp-muted)]">
                  Rear Label
                </p>

                <span className="bp-label text-[var(--bp-orange)]">
                  Pro
                </span>
              </div>

              {entitlementsLoading ? (
                <div className="flex aspect-square w-full items-center justify-center border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
                  <div className="text-center">
                    <div className="mx-auto h-7 w-7 animate-pulse border border-[var(--bp-line-strong)]" />

                    <p className="bp-code mt-3 text-[var(--bp-muted)]">
                      Checking access...
                    </p>
                  </div>
                </div>
              ) : isPro ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      labelInputRef.current?.click()
                    }
                    className="group relative flex aspect-square w-full items-center justify-center overflow-hidden border border-[var(--bp-line)] bg-[var(--bp-paper-light)]"
                  >
                    {formData.labelImage ? (
                      <>
                        <img
                          src={
                            formData.labelImage
                          }
                          alt="Back of coffee bag"
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(12,39,72,0.55)] opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="bp-label text-white">
                            Change image
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <svg
                          className="mx-auto h-7 w-7 text-[var(--bp-muted)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>

                        <p className="bp-code mt-3 text-[var(--bp-muted)]">
                          Add image
                        </p>
                      </div>
                    )}
                  </button>

                  <input
                    ref={labelInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={event =>
                      handleImageUpload(
                        event,
                        'labelImage'
                      )
                    }
                  />
                </>
              ) : (
                <div className="flex aspect-square w-full items-center justify-center border border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-5">
                  <div className="max-w-[180px] text-center">
                    <svg
                      className="mx-auto h-7 w-7 text-[var(--bp-orange)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2h-1V8a5 5 0 00-10 0v3H6a2 2 0 00-2 2v6a2 2 0 002 2zm3-10V8a3 3 0 016 0v3H9z"
                      />
                    </svg>

                    <p className="bp-label mt-3 text-[var(--bp-blue)]">
                      Brewprint Pro
                    </p>

                    <p className="bp-code mt-2 text-[var(--bp-muted)]">
                      Add a rear bag reference photo with Pro.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="bp-index">
              04.02 / IDENTITY
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Coffee Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 border border-[var(--bp-line)] md:grid-cols-2">
            <div className="border-b border-[var(--bp-line)] p-4 md:border-r">
              <label className="bp-label text-[var(--bp-muted)]">
                Coffee Name *
              </label>

              <input
                name="name"
                required
                value={
                  formData.name || ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
                placeholder="Ethiopia Sidamo"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Roaster *
              </label>

              <input
                name="roaster"
                required
                value={
                  formData.roaster || ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
                placeholder="Roaster name"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4 md:border-b-0 md:border-r">
              <label className="bp-label text-[var(--bp-muted)]">
                Roaster Location
              </label>

              <input
                name="roasterLocation"
                value={
                  formData.roasterLocation ||
                  ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
                placeholder="Johannesburg, South Africa"
              />
            </div>

            <div className="p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Roaster Website
              </label>

              <input
                name="roasterURL"
                type="url"
                value={
                  formData.roasterURL ||
                  ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
                placeholder="https://..."
              />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="bp-index">
              04.03 / ORIGIN
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Origin & Production
            </h3>
          </div>

          <div className="grid grid-cols-1 border border-[var(--bp-line)] md:grid-cols-2">
            <div className="border-b border-[var(--bp-line)] p-4 md:border-r">
              <label className="bp-label text-[var(--bp-muted)]">
                Country / Origin
              </label>

              <input
                name="origin"
                value={
                  formData.origin || ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
                placeholder="Colombia"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Region
              </label>

              <input
                name="region"
                value={
                  formData.region || ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
                placeholder="Huila"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4 md:border-r">
              <label className="bp-label text-[var(--bp-muted)]">
                Farm / Estate
              </label>

              <input
                name="farm"
                value={
                  formData.farm || ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
                placeholder="Finca El Diviso"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Producer
              </label>

              <input
                name="producer"
                value={
                  formData.producer || ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
                placeholder="Producer name"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4 md:border-r">
              <label className="bp-label text-[var(--bp-muted)]">
                Varietal
              </label>

              <input
                name="varietal"
                value={
                  formData.varietal || ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
                placeholder="Pink Bourbon"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Altitude
              </label>

              <input
                name="altitude"
                value={
                  formData.altitude || ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
                placeholder="1750 to 1900 MASL"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4 md:border-r md:border-b-0">
              <label className="bp-label text-[var(--bp-muted)]">
                Harvest Season
              </label>

              <input
                name="harvestSeason"
                value={
                  formData.harvestSeason ||
                  ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
                placeholder="2025 main harvest"
              />
            </div>

            <div className="p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Terroir
              </label>

              <textarea
                name="terroir"
                value={
                  formData.terroir || ''
                }
                onChange={handleChange}
                className="bp-input mt-2 min-h-28 resize-y"
                placeholder="Climate, soil or site information"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="bp-index">
              04.04 / PROCESS
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Processing
            </h3>
          </div>

          <div className="border border-[var(--bp-line)] p-4">
            <label className="bp-label text-[var(--bp-muted)]">
              Process Method
            </label>

            <input
              name="process"
              value={
                formData.process || ''
              }
              onChange={handleChange}
              className="bp-input mt-2"
              placeholder="Washed, Natural, Anaerobic..."
            />
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="bp-index">
              04.05 / ROAST & PURCHASE
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Roast, Purchase & Bag
            </h3>
          </div>

          <div className="grid grid-cols-1 border border-[var(--bp-line)] sm:grid-cols-2">
            <div className="border-b border-[var(--bp-line)] p-4 sm:border-r">
              <label className="bp-label text-[var(--bp-muted)]">
                Roast Level
              </label>

              <select
                name="roastLevel"
                value={
                  formData.roastLevel
                }
                onChange={handleChange}
                className="bp-input mt-2"
              >
                {Object.values(
                  RoastLevel
                ).map(level => (
                  <option
                    key={level}
                    value={level}
                  >
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-b border-[var(--bp-line)] p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Roast Date
              </label>

              <input
                name="roastDate"
                type="date"
                value={
                  formData.roastDate || ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4 sm:border-r">
              <label className="bp-label text-[var(--bp-muted)]">
                Purchase Date
              </label>

              <input
                name="purchaseDate"
                type="date"
                value={
                  formData.purchaseDate ||
                  ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Price
              </label>

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={
                  formData.price ?? ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
                placeholder="0.00"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4 sm:border-b-0 sm:border-r">
              <label className="bp-label text-[var(--bp-muted)]">
                Bag Weight (g)
              </label>

              <input
                name="totalWeight"
                type="number"
                min="1"
                step="1"
                value={
                  formData.totalWeight ??
                  ''
                }
                onChange={handleChange}
                className="bp-input mt-2"
              />
            </div>

            <div className="p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Remaining Weight (g)
              </label>

              <input
                name="remainingWeight"
                type="number"
                min="0"
                step="1"
                disabled={!initialData}
                value={
                  initialData
                    ? formData.remainingWeight ??
                      ''
                    : formData.totalWeight ??
                      ''
                }
                onChange={handleChange}
                className="bp-input mt-2 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {!initialData && (
                <p className="bp-code mt-2 text-[var(--bp-muted)]">
                  New records start at the full bag weight.
                </p>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="bp-index">
              04.06 / SENSORY
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Sensory & Notes
            </h3>
          </div>

          <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
            <div className="border-b border-[var(--bp-line)] p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Tasting Notes on Bag
              </label>

              <div className="mt-3 grid grid-cols-[1fr_auto]">
                <input
                  value={
                    tastingNoteInput
                  }
                  onChange={event =>
                    setTastingNoteInput(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleTastingNoteKeyDown
                  }
                  className="bp-input rounded-r-none"
                  placeholder="Add tasting note"
                />

                <button
                  type="button"
                  onClick={
                    handleAddTastingNote
                  }
                  className="flex min-w-12 items-center justify-center border border-l-0 border-[var(--bp-line-strong)] bg-[var(--bp-orange)] px-4 text-[var(--bp-blue)]"
                >
                  <span className="bp-label">
                    Add
                  </span>
                </button>
              </div>

              {formData.bagTastingNotes &&
                formData.bagTastingNotes
                  .length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formData.bagTastingNotes.map(
                      (note, index) => (
                        <span
                          key={`${note}-${index}`}
                          className="flex items-center gap-2 border border-[var(--bp-line)] px-3 py-2 bp-code text-[var(--bp-blue)]"
                        >
                          {note}

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveTastingNote(
                                index
                              )
                            }
                            className="text-[var(--bp-danger)]"
                            aria-label={`Remove ${note}`}
                          >
                            ×
                          </button>
                        </span>
                      )
                    )}
                  </div>
                )}
            </div>

            <div className="p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Personal Notes
              </label>

              <textarea
                name="personalNotes"
                value={
                  formData.personalNotes ||
                  ''
                }
                onChange={handleChange}
                className="bp-input mt-2 min-h-32 resize-y"
                placeholder="Initial impressions, aroma, purchase notes or anything else useful."
              />
            </div>
          </div>
        </section>
      </div>

      <div
        className="sticky bottom-0 z-20 -mx-4 mt-10 grid grid-cols-2 border-t border-[var(--bp-line-strong)] bg-[var(--bp-paper)] sm:-mx-6"
        style={{
          paddingBottom:
            'env(safe-area-inset-bottom)',
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="bp-label min-h-14 border-r border-[var(--bp-line)] px-4 text-[var(--bp-blue)]"
        >
          Discard
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="min-h-14 bg-[var(--bp-orange)] px-4 text-[var(--bp-blue)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="bp-label">
            {isSaving
              ? 'Saving...'
              : initialData
                ? 'Update Record'
                : 'Save Record'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default CoffeeBeanForm;