input_folder="./public/audio/ringtones"
output_folder="./src/app/db/"

# inicializa o json
json_entries=()

# conta o numero de arquivos na pasta
total_files=$(find "$input_folder" -maxdepth 1 -type f | wc -l)
current_file=0

for file_path in "$input_folder"/*; do
  if [ -f "$file_path" ]; then
    # incrementa o contador
    ((current_file++))

    # extrai o nome do arquivo e extensão
    file_name=$(basename -- "$file_path")
    file_extension="${file_name##*.}"

    # remove a extensao do nome do arquivo
    file_name_no_ext="${file_name%.*}"

    # converte pra titlecase
    title_case_name=$(echo "$file_name_no_ext" | sed 's/_/ /g' | awk '{for(i=1;i<=NF;i++)$i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')

    # checa se é a ultima entrada
    if [ "$current_file" -eq "$total_files" ]; then
      # se é o ultimo não adiciona ','
      json_entry="{\"slug\": \"$file_name_no_ext\", \"format\": \".${file_extension}\", \"title\": \"$title_case_name\"}"
    else
      # se não é o ultimo adiciona a ','
      json_entry="{\"slug\": \"$file_name_no_ext\", \"format\": \".${file_extension}\", \"title\": \"$title_case_name\"},"
    fi

    # adiciona ao bloco json
    json_entries+=("$json_entry")

    echo "processou o arquivo: $file_path"
  fi
done

# escreve o arquivo json final
output_file="${output_folder}/ringtones.db.js"

# abre o json [
echo "const ringtonesList = [" > "$output_file"

# preenche o json
echo "${json_entries[*]}" | sed 's/}{/},{/g' >> "$output_file"

# fecha ] json
echo "]; export default ringtonesList" >> "$output_file"

echo "saida em: $output_file"