import Link from 'next/link';

export function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.styled-components file.
   */
  return (
    <div>
      <p>
        <Link href="/orientation-lock/camera-rotation">
          Orientation lock (rotate camera)
        </Link>
      </p>
      <p>
        <Link href="/orientation-lock/canvas-transform">
          Orientation lock (rotate canvas)
        </Link>
      </p>
      <p>
        <Link href="/scene/city">Scene: City</Link>
      </p>
    </div>
  );
}

export default Index;
