import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, mergeMap } from 'rxjs/operators';

@Pipe({
  name: 'relationship'
})
export class RelationshipPipe implements PipeTransform {

  constructor(
    private http: HttpClient
  ) {}

  transform(value: any, relationship: string): any {

    const link = value[relationship]['links']['self'];

    if (relationship === 'genres') {
      return this.genres(link);   
    } else if (relationship === 'categories') {
      return this.categories(link);   
    } else if (relationship === 'staff') {
      return this.staff(link);   
    } else if (relationship === 'productions') {
      return this.productions(link);   
    } else if (relationship === 'episodes') {
      return this.episodes(link);   
    }
  }

  genres(link: string) {
    return this.http.get(link).pipe(
      map((genre) => genre['data']),
      map((data) => data.map(e => +e['id'])),
      map((data) => {
        return data.map((id: number) => {
          return this.http.get(`https://kitsu.io/api/edge/genres/${id}`)
        })
      }),
      map((genre) => {
        return genre.map((data) => {
          return data.pipe( 
            map(e => e['data']['attributes']), 
            map(e => e['name']) 
          )
        })
      })
    )
  }

  categories(link: string) {
    return this.http.get(link).pipe(
      map((category) => category['data']),
      map((data) => data.map(e => +e['id'])),
      map((data) => {
        return data.map((id: number) => {
          return this.http.get(`https://kitsu.io/api/edge/categories/${id}`)
        })
      }),
      map((category) => {
        return category.map((data) => {
          return data.pipe(
            map(e => e['data']['attributes']), 
            map((e) => {
              return {
                title: e['title'],
                description: e['description'],
                image: e['image']
              }
            }) 
          )
        })
      })
    )
  }

  staff(link: string) {
    return this.http.get(link).pipe(
      map((staff) => staff['data']),
      map((data) => data.map(e => +e['id'])),
      map((data) => {
        return data.map((id: number) => {
          return this.http.get(`https://kitsu.io/api/edge/media-staff/${id}`)
        })
      }),
      map((staff) => {
        return staff.map((data) => {
          return data.pipe(
            mergeMap((e) => {
              const role = e['data']['attributes']['role']
              const link = e['data']['relationships']['person']['links']['related'];
              return this.http.get(link).pipe( 
                map(e => e['data']['attributes']['name']),
                map((name) => ({ name, role })) 
              )
            })
          )
        })
      })
    );
  }

  productions(link: string) {
    return this.http.get(link).pipe(
      map((production) => production['data']),
      map((data) => data.map(e => +e['id'])),
      map((data) => {
        return data.map((id: number) => {
          return this.http.get(`https://kitsu.io/api/edge/media-productions/${id}`)
        })
      }),
      map((production) => {
        return production.map((data) => {
          return data.pipe(
            mergeMap((e) => {
              const role = e['data']['attributes']['role']
              const link = e['data']['relationships']['company']['links']['related'];
              return this.http.get(link).pipe( 
                map(e => e['data']['attributes']['name']),
                map((name) => ({ name, role })) 
              )
            })
          )
        })
      })
    );
  }

  episodes(link: string) {
    return this.http.get(link).pipe(
      map((episode) => episode['data']),
      map((data) => data.map(e => +e['id'])),
      map((data) => {
        return data.map((id: number) => {
          return this.http.get(`https://kitsu.io/api/edge/episodes/${id}`)
        })
      }),
      map((episode) => {
        return episode.map((data) => {
          return data.pipe(
            map(e => e['data']['attributes'])
          );
        })
      })
    );
  }

}