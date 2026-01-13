export default async function UserProfilePage(props: { params: { id: string } }) {
  const { id } = await props.params;
  return <div>Profile de l&apos;utilisateur {id}</div>;
}