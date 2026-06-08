
export function calculateAngle(
  A: { x: number; y: number },
  B: { x: number; y: number },
  C: { x: number; y: number }
) {
  const angleBA = Math.atan2(A.y - B.y, A.x - B.x);
  const angleBC = Math.atan2(C.y - B.y, C.x - B.x);
  
  let angle = Math.abs((angleBA - angleBC) * (180 / Math.PI));
  
  if (angle > 180) angle = 360 - angle;
  
  return angle;
}