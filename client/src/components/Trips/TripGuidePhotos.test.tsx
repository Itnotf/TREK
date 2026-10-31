import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildGuideDraft } from '../../../tests/helpers/itinerary';
import { fireEvent, render, screen, waitFor } from '../../../tests/helpers/render';
import { fetchPhoto } from '../../services/photoService';
import { useAuthStore } from '../../store/authStore';
import { TripGuideContents } from './TripGuideContents';

vi.mock('../../services/photoService', () => ({ fetchPhoto: vi.fn(), getCached: vi.fn(() => undefined) }));

const firstPhoto = '/api/maps/place-photo/way%3A1/bytes';
const secondPhoto = '/api/maps/place-photo/way%3A2/bytes';
function plan() {
  const value = buildGuideDraft().plan;
  const stop = value.days[0].stops[0];
  value.days[0].stops = [
    {
      ...stop,
      id: 'first',
      kind: 'visit',
      name: 'Old town',
      location: { lat: 30.75, lng: 103.6, place_id: 'way:1', address: 'Old town entrance' },
    },
    {
      ...stop,
      id: 'second',
      kind: 'visit',
      name: 'Second town',
      location: { lat: 30.8, lng: 103.5, place_id: 'way:2', address: 'Second town square' },
    },
  ];
  return value;
}
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', undefined);
  useAuthStore.setState({ placesPhotosEnabled: true });
  vi.mocked(fetchPhoto).mockImplementation((key, _id, _lat, _lng, _name, callback) =>
    callback?.({
      photoUrl: key === 'way:1' ? firstPhoto : secondPhoto,
      thumbDataUrl: null,
      attribution: 'Photographer · CC BY-SA · https://commons.wikimedia.org/wiki/File:Old_town.jpg',
    })
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

describe('guide photos', () => {
  it('shows an eager trip cover, attraction photos, credits and actual map location', async () => {
    render(<TripGuideContents plan={plan()} />);
    const cover = await screen.findByTestId('trip-guide-cover');
    await waitFor(() => expect(cover.querySelector('img')).toHaveAttribute('src', firstPhoto));
    expect(screen.getAllByAltText('Old town')).toHaveLength(2);
    expect(screen.getAllByText(/Photographer · CC BY-SA/).length).toBeGreaterThan(1);
    expect(screen.getAllByRole('link', { name: 'Photographer · CC BY-SA' })[0]).toHaveAttribute(
      'href',
      'https://commons.wikimedia.org/wiki/File:Old_town.jpg'
    );
    expect(screen.getByRole('link', { name: 'Old town entrance' })).toHaveAttribute(
      'href',
      expect.stringContaining('https://uri.amap.com/marker?')
    );
  });
  it('uses the next verified attraction when the first photo fails', async () => {
    render(<TripGuideContents plan={plan()} />);
    const cover = await screen.findByTestId('trip-guide-cover');
    await waitFor(() => expect(cover.querySelector('img')).toHaveAttribute('src', firstPhoto));
    const img = cover.querySelector('img');
    if (!img) throw Error('Missing cover');
    fireEvent.error(img);
    await waitFor(() => expect(cover.querySelector('img')).toHaveAttribute('src', secondPhoto));
  });
  it('does not invent a picture when none is available or show external model image URLs', async () => {
    vi.mocked(fetchPhoto).mockImplementation((_key, _id, _lat, _lng, _name, callback) =>
      callback?.({ photoUrl: 'https://unverified.example/image.jpg', thumbDataUrl: null })
    );
    render(<TripGuideContents plan={plan()} />);
    await waitFor(() => expect(fetchPhoto).toHaveBeenCalled());
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getAllByRole('heading', { name: 'Old town' })[0]).toBeVisible();
  });
  it('respects the photo setting without hiding location information', () => {
    useAuthStore.setState({ placesPhotosEnabled: false });
    render(<TripGuideContents plan={plan()} />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(fetchPhoto).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Old town entrance' })).toBeVisible();
  });
  it('does not reuse an old place image when the same activity changes locations', async () => {
    const value = plan();
    const view = render(<TripGuideContents plan={value} />);
    await screen.findAllByAltText('Old town');
    const changed = structuredClone(value);
    changed.days[0].stops[0] = {
      ...changed.days[0].stops[0],
      name: 'New town',
      location: { lat: 30.9, lng: 103.7, place_id: 'way:3', address: 'New entrance' },
    };
    vi.mocked(fetchPhoto).mockImplementation((_key, _id, _lat, _lng, _name, callback) =>
      callback?.({ photoUrl: null, thumbDataUrl: null })
    );
    view.rerender(<TripGuideContents plan={changed} />);
    expect(screen.queryByAltText('Old town')).toBeNull();
    expect(screen.queryByAltText('New town')).toBeNull();
  });
});
